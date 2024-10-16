/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Log in a user
 *     description: Authenticate a user with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 description: The user's userName.
 *                 example: 'user userName'
 *               name:
 *                 type: string
 *                 description: The user's name.
 *                 example: 'user name'
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: 'user@example.com'
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: 'password123'
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token.
 *       400:
 *         description: Invalid email or password.
 */
