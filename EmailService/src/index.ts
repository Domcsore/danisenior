import nodemailer from "nodemailer";
import express from "express";

interface ContactData {
    name: string;
    email: string;
    message: string;
    ref: string;
}

class StatusError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);

        this.status = status;
    }
}

function arrayEveryAll(array: Array<any>, callback: (element: any, index: number, array: Array<any>) => boolean) {
    let every = true;
    for(let i = 0; i < array.length; i++) {
        if (!callback(array[i], i, array)) every = false;
    }
    return every;
}

function contactDataFromBody(body: any): ContactData {
    const requiredProperties = ["name", "email", "message", "ref"];
    let doesNotContain = [];
    let containsRequiredProperties = arrayEveryAll(requiredProperties,(x) => {
        let hasProperty = x in body;
        if (!hasProperty) {
            doesNotContain.push(x);
        }
        return hasProperty;
    });

    if (!containsRequiredProperties) {
        throw new StatusError("body does not contain the required properties: missing " + doesNotContain.join(','), 400);
    }

    return {
        name: body.name,
        email: body.email,
        message: body.message,
        ref: body.ref,
    }
}

const app = express();

app.locals.transporter = nodemailer.createTransport({
    host: "",
    port: 587,
    secure: true,
    auth: {
        user: "test",
        pass: "test"
    }
});

app.use(express.json());

app.post('/contact', [(req: express.Request, res: express.Response, next:express.NextFunction) => {
    try {
        res.locals.data = contactDataFromBody(req.body);
    } catch (e) {
        next(e);
    }
    next();
}, async (req: express.Request, res: express.Response, next:express.NextFunction) => {
    //todo add to email, ref dependant

    try {
        let info = await app.locals.transporter.sendMail({
            from: `"${res.locals.data.name}" <${res.locals.data.email}>`,
            to: res.locals.data.email,
            subject: `You have an enquiry from ${res.locals.data.name}`,
            text: `Name: ${res.locals.data.name}\tEmail: ${res.locals.data.email}\tMessage: ${res.locals.data.message}`
        });
    } catch(e) {
        next(new StatusError(e.message, 500));
    }
    next();
}, (req: express.Request, res: express.Response) => {
    res.send();
}]);

app.use((err: StatusError, req, res, next) => {
    if (err) {
        console.error(err.message);
        res.status(err.status).json({error:{message:err.message, status:err.status}});
    } else {
        next();
    }
});

app.listen(3000, () => {console.log("Dani senior faas running on port 3000")});