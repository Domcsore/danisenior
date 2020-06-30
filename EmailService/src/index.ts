import nodemailer from "nodemailer";
import express from "express";
import config from "config";

interface ContactData {
    name: string;
    email: string;
    message: string;
    ref: string;
}

interface IRefOption {
    ref: string;
    email: string;
}

interface IRefOptions {
    default: string;
    options: IRefOption[];
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

function getOutgoingEmail(refOptions: IRefOptions, ref: string): string {
    let results = refOptions.options.filter(option => option.ref === ref);
    let result = results[0];

    if (result) {
        console.log("ref email")
        return result.email;
    }

    console.log("default email");
    return refOptions.default;
}

const app = express();

app.locals.transporter = nodemailer.createTransport({
    host: config.get('Email.outgoingServer'),
    port: 465,
    secure: true,
    auth: {
        user: config.get('Email.user'),
        pass: config.get('Email.password')
    }
});

app.locals.refs = <IRefOptions>config.get('Email.refOptions');

app.use(express.json());

app.post('/contact', [(req: express.Request, res: express.Response, next:express.NextFunction) => {
    try {
        res.locals.data = contactDataFromBody(req.body);
    } catch (e) {
        next(e);
    }
    next();
}, async (req: express.Request, res: express.Response, next:express.NextFunction) => {
    let outgoingEmail = getOutgoingEmail(app.locals.refs, res.locals.data.ref);

    try {
        let info = await app.locals.transporter.sendMail({
            from: `"${res.locals.data.name}" <${res.locals.data.email}>`,
            to: outgoingEmail,
            subject: `You have an enquiry from ${res.locals.data.name}`,
            text: `Name: ${res.locals.data.name}\tEmail: ${res.locals.data.email}\tMessage: ${res.locals.data.message}`
        });

        res.locals.info = info;
    } catch(e) {
        next(new StatusError(e.message, 500));
    }
    next();
}, (req: express.Request, res: express.Response) => {
    res.send();
}]);

app.use((err: StatusError, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err) {
        console.error(err.message);
        res.status(err.status).json({error:{message:err.message, status:err.status}});
    } else {
        res.status(200).json({info: res.locals.info});
        next();
    }
});

app.listen(config.get("Port"), () => {console.log(`Dani senior faas running on port ${config.get("Port")}`)});