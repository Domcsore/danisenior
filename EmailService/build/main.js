"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("config"));
class StatusError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
function arrayEveryAll(array, callback) {
    let every = true;
    for (let i = 0; i < array.length; i++) {
        if (!callback(array[i], i, array))
            every = false;
    }
    return every;
}
function contactDataFromBody(body) {
    const requiredProperties = ["name", "email", "message", "ref"];
    let doesNotContain = [];
    let containsRequiredProperties = arrayEveryAll(requiredProperties, (x) => {
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
    };
}
function getOutgoingEmail(refOptions, ref) {
    let results = refOptions.options.filter(option => option.ref === ref);
    let result = results[0];
    if (result) {
        console.log("ref email");
        return result.email;
    }
    console.log("default email");
    return refOptions.default;
}
const app = express_1.default();
app.locals.transporter = nodemailer_1.default.createTransport({
    host: config_1.default.get('Email.outgoingServer'),
    port: 465,
    secure: true,
    auth: {
        user: config_1.default.get('Email.user'),
        pass: config_1.default.get('Email.password')
    }
});
app.locals.refs = config_1.default.get('Email.refOptions');
app.use(express_1.default.json());
app.post('/contact', [(req, res, next) => {
        try {
            res.locals.data = contactDataFromBody(req.body);
        }
        catch (e) {
            next(e);
        }
        next();
    }, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let outgoingEmail = getOutgoingEmail(app.locals.refs, res.locals.data.ref);
        try {
            let info = yield app.locals.transporter.sendMail({
                from: `"${res.locals.data.name}" <${res.locals.data.email}>`,
                to: outgoingEmail,
                subject: `You have an enquiry from ${res.locals.data.name}`,
                text: `Name: ${res.locals.data.name}\tEmail: ${res.locals.data.email}\tMessage: ${res.locals.data.message}`
            });
            res.locals.info = info;
        }
        catch (e) {
            next(new StatusError(e.message, 500));
        }
        next();
    }), (req, res) => {
        res.send();
    }]);
app.use((err, req, res, next) => {
    if (err) {
        console.error(err.message);
        res.status(err.status).json({ error: { message: err.message, status: err.status } });
    }
    else {
        res.status(200).json({ info: res.locals.info });
        next();
    }
});
app.listen(config_1.default.get("Port"), () => { console.log(`Dani senior faas running on port ${config_1.default.get("Port")}`); });
//# sourceMappingURL=main.js.map