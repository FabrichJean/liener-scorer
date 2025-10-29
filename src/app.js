const express = require('express');
const http = require('http');
const qs = require('qs');

const app = express();
const server = http.createServer(app);

const dotenv = require('dotenv')

dotenv.config()


// CORS
const cors = require('cors');
let { getDoneIssuesByMonth } = require('./linear');
let allowedOrigins = '*';
if (allowedOrigins === '*') {
  app.use(cors());
} else {
  allowedOrigins = allowedOrigins.split(',').map(o => o.trim());
  app.use(cors({
    origin: function (origin, callback) {
      // Autorise les requêtes sans origin (ex: mobile, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  }));
}

const PRIORITY_SCORES = {
  urgent: 3.5,
  high: 3,
  medium: 2,
  none: 2,
  low: 1,
};


app.get('/', async (req, res) => {
  res.sendFile(__dirname+'/app.html')
})


// 🧩 Nouvelle route pour les scores des créateurs
app.get("/scores", async (req, res) => {
  const token = req.header.token;

  try {
    const { year, month } = req.query; // ex: /score?year=2025&month=10
    const doneIssues = await getDoneIssuesByMonth(Number(year), Number(month));

    // Calculer le score par assignee
    const scores = {};

    for (const issue of doneIssues) {
      let assigneeName = "Non assigné";

      if (issue.assignee) {
        try {
          // issue.assignee peut être une Promise<User>
          const assigneeObj = await issue.assignee;
          assigneeName = assigneeObj?.name || "Non assigné";
        } catch (err) {
          console.warn("Impossible de récupérer l'assignee pour l'issue", issue.id, err);
          // On laisse assigneeName = "Non assigné"
        }
      }

      const priority = (issue.priorityLabel || "Aucune").toLowerCase();
      const score = PRIORITY_SCORES[priority] || 1;

      if (!scores[assigneeName]) scores[assigneeName] = 0;
      scores[assigneeName] += score;
    }


    // Transformer en tableau trié
    const ranking = Object.entries(scores)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score);

    res.json({ month, year, totalIssues: doneIssues.length, ranking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors du calcul du scoring" });
  }
});



const PORT = 7894;
const start = async () => {
    server.listen(PORT, () => {
      console.log(`- Main: http://${HOST}:${PORT}`);
    })
};

start();

module.exports = app;


