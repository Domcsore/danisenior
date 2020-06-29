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
const app = express_1.default();
app.locals.transporter = nodemailer_1.default.createTransport({
    host: "",
    port: 587,
    secure: true,
    auth: {
        user: "test",
        pass: "test"
    }
});
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
        try {
            let info = yield app.locals.transporter.sendMail({
                from: `"${res.locals.data.name}" <${res.locals.data.email}>`,
                to: "",
            });
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
        next();
    }
});
app.listen(3000, () => { console.log("Dani senior faas running on port 3000"); });
//# sourceMappingURL=index.js.map