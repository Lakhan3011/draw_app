import express from 'express';
import { signInSchema, signUpSchema } from '@repo/common/schema';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config";

const app = express();
app.use(express.json());
const PORT = 3000;

app.get('/hi', (req, res) => {
    res.json({
        message: "hi from hhtp server"
    })
});

app.post('/signup', (req, res) => {
    const result = signUpSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(404).json({
            message: "Invalid Input data"
        })
    }

    return res.status(200).json({
        success: true,
        message: "You are signed up!!"
    })
});


app.post('/signin', (req, res) => {
    const result = signInSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(404).json({
            message: "Invalid Input data"
        })
    }

    // DB call to get user Id
    const userId = 1;

    const token = jwt.sign({ userId }, JWT_SECRET);

    return res.status(200).json({
        success: true,
        token: token,
        message: "You are signed in"
    })
});

app.post('/room', (req, res) => {

})


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
});
