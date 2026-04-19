import express from 'express';
import cors from 'cors';
import orderRoutes from './routes/orderRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', orderRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});