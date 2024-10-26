const request = require('supertest');
const app = require('../my-backend/server'); // Adjust path if needed
const jwt = require('jsonwebtoken');

describe('Product Management API', () => {
    let authToken;
    const userCredentials = { username: 'testUser', password: 'testPassword' };

    // Helper function to register and log in a user for token-based tests
    beforeAll(async () => {
        // Register the user
        await request(app).post('/auth/register').send(userCredentials);

        // Log in to get JWT token
        const loginResponse = await request(app).post('/auth/login').send(userCredentials);
        authToken = loginResponse.body.token;
    });

    it('should fetch all products', async () => {
        const response = await request(app).get('/products');
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    it('should add a new product', async () => {
        const product = { name: 'Test Product', description: 'Description', price: 10.0, quantity: 5 };
        const response = await request(app).post('/products').send(product);
        expect(response.statusCode).toBe(201);
        expect(response.body.name).toBe(product.name);
    });

    it('should not add a product with invalid data', async () => {
        const invalidProduct = { name: 'Invalid Product' };
        const response = await request(app).post('/products').send(invalidProduct);
        expect(response.statusCode).toBe(400);
    });

    it('should update a product with valid token', async () => {
        const product = { name: 'Product to Update', description: 'Desc', price: 15.0, quantity: 10 };
        const newProduct = await request(app).post('/products').send(product);

        const updatedProductData = { name: 'Updated Product', description: 'Updated Desc', price: 20.0, quantity: 15 };
        const response = await request(app)
            .put(`/products/${newProduct.body.id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updatedProductData);

        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe(updatedProductData.name);
    });

    it('should not update a product without token', async () => {
        const product = { name: 'Product for Unauthorized Update', description: 'Desc', price: 12.0, quantity: 8 };
        const newProduct = await request(app).post('/products').send(product);

        const updatedProductData = { name: 'Attempted Update', description: 'Updated Desc', price: 20.0, quantity: 15 };
        const response = await request(app)
            .put(`/products/${newProduct.body.id}`)
            .send(updatedProductData);

        expect(response.statusCode).toBe(403);
    });

    it('should delete a product with valid token', async () => {
        const product = { name: 'Product to Delete', description: 'Desc', price: 12.0, quantity: 8 };
        const newProduct = await request(app).post('/products').send(product);

        const response = await request(app)
            .delete(`/products/${newProduct.body.id}`)
            .set('Authorization', `Bearer ${authToken}`);
        
        expect(response.statusCode).toBe(204);
    });

    it('should not delete a product without token', async () => {
        const product = { name: 'Product for Unauthorized Delete', description: 'Desc', price: 10.0, quantity: 6 };
        const newProduct = await request(app).post('/products').send(product);

        const response = await request(app).delete(`/products/${newProduct.body.id}`);
        expect(response.statusCode).toBe(403);
    });

    it('should fail login with incorrect credentials', async () => {
        const response = await request(app).post('/auth/login').send({ username: 'wrongUser', password: 'wrongPass' });
        expect(response.statusCode).toBe(401);
    });
});
