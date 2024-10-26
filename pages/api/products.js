import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
});

// JWT secret key
const key = process.env.JWT_SECRET;

const verifyToken = (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        res.status(403).send('Token required');
        return null;
    }
    try {
        return jwt.verify(token.split(' ')[1], key);
    } catch {
        res.status(403).send('Invalid token');
        return null;
    }
};

export default async function handler(req, res) {
    const { method } = req;

    switch (method) {
        case 'GET':
            try {
                const result = await pool.query('SELECT * FROM products');
                res.status(200).json(result.rows);
            } catch (error) {
                res.status(500).json({ error: 'Internal Server Error' });
            }
            break;

        case 'POST':
            const { name, description, price, quantity } = req.body;
            try {
                const result = await pool.query(
                    'INSERT INTO products (name, description, price, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
                    [name, description, price, quantity]
                );
                res.status(201).json(result.rows[0]);
            } catch (error) {
                res.status(400).json({ error: 'Bad Request' });
            }
            break;

        case 'PUT':
            if (!verifyToken(req, res)) return;
            const { id } = req.query;
            const { name: updateName, description: updateDescription, price: updatePrice, quantity: updateQuantity } = req.body;
            try {
                const result = await pool.query(
                    'UPDATE products SET name = $1, description = $2, price = $3, quantity = $4 WHERE id = $5 RETURNING *',
                    [updateName, updateDescription, updatePrice, updateQuantity, id]
                );
                result.rows.length > 0
                    ? res.status(200).json(result.rows[0])
                    : res.status(404).json({ error: 'Product not found' });
            } catch (error) {
                res.status(400).json({ error: 'Bad Request' });
            }
            break;

        case 'DELETE':
            if (!verifyToken(req, res)) return;
            try {
                const result = await pool.query('DELETE FROM products WHERE id = $1', [req.query.id]);
                result.rowCount > 0
                    ? res.status(204).end()
                    : res.status(404).json({ error: 'Product not found' });
            } catch (error) {
                res.status(500).json({ error: 'Internal Server Error' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
