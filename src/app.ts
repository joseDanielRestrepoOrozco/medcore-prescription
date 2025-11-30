import express from 'express';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/v1', (_req, res) => {
    res.send('Hello World!');
});

export default app;
