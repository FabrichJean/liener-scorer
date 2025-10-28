const express = require('express');
const http = require('http');
const qs = require('qs');

const app = express();
const server = http.createServer(app);


// CORS
const cors = require('cors');
let client = require('./linear');
const { default: axios } = require('axios');
const { LinearClient } = require('@linear/sdk');
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


app.get('/', async (req, res) => {
  res.send('hello word')
})

app.get("/projects", async (req, res) => {
  try {
    const projects = await client.projects();
    res.json(projects.nodes); // nodes contient la liste des projets
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Impossible de récupérer les projets Linear" });
  }
});

app.get("/projects/:id/todos", async (req, res) => {
  const projectId = req.params.id;

  try {
    // Récupère toutes les issues du projet
    const issues = await client.issues({
      filter: {
        project: { id: { eq: projectId } },
        state: { name: { eq: "Done" } }, // filtre par état "Done"
      },
    });

    res.json(issues.nodes);
  } catch (error) {
    console.error("Erreur Linear:", error);
    res.status(500).json({ error: "Impossible de récupérer les todos Done" });
  }
});

app.get("/oauth/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const data = qs.stringify({
      code,
      client_id: "eb1d6ec64ea606c03e0e1ecf3e388952",
      client_secret: "672967efa7df48628af0f518eb862f07",
      redirect_uri: "http://localhost:3000/oauth/callback",
      grant_type: "authorization_code",
    });

    const response = await axios.post(
      "https://api.linear.app/oauth/token",
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = response.data.access_token;

    client = new LinearClient({ apiKey: accessToken });

    const projects = await client.projects();

    res.send(`
      ✅ Extension connectée !
      <br>Token : ${accessToken}
      <br>Projets Linear : ${projects.nodes.map(p => p.name).join(", ")}
    `);
  } catch (error) {
    console.error("Erreur OAuth Linear:", error.response?.data || error);
    res.status(500).send("Erreur lors de la connexion à Linear");
  }
});



const PORT = 3000;
const HOST = 'localhost';
const start = async () => {
  try {

    server.listen(PORT, HOST, () => {
      const settings = global.activeSettings;
      console.log(`Server running on http://${HOST}:${PORT}`);
      console.log(`API endpoints available at:`);
      console.log(`- Main: http://${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server, DB error:', err);

    server.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT} (DB not available)`);
    });
  }
};

start();

module.exports = app;
