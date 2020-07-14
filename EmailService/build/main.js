"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var nodemailer_1 = __importDefault(require("nodemailer"));
var express_1 = __importDefault(require("express"));
var config_1 = __importDefault(require("config"));
var cors_1 = __importDefault(require("cors"));
var StatusError = /** @class */ (function (_super) {
    __extends(StatusError, _super);
    function StatusError(message, status) {
        var _this = _super.call(this, message) || this;
        _this.status = status;
        return _this;
    }
    return StatusError;
}(Error));
function arrayEveryAll(array, callback) {
    var every = true;
    for (var i = 0; i < array.length; i++) {
        if (!callback(array[i], i, array))
            every = false;
    }
    return every;
}
function contactDataFromBody(body) {
    var requiredProperties = ["name", "email", "message", "ref"];
    var doesNotContain = [];
    var containsRequiredProperties = arrayEveryAll(requiredProperties, function (x) {
        var hasProperty = x in body;
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
    var results = refOptions.options.filter(function (option) { return option.ref === ref; });
    var result = results[0];
    if (result) {
        console.log("ref email");
        return result.email;
    }
    console.log("default email");
    return refOptions.default;
}
// Server implementation
var app = express_1.default();
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
app.use(cors_1.default());
app.post('/contact', [function (req, res, next) {
        try {
            res.locals.data = contactDataFromBody(req.body);
        }
        catch (e) {
            next(e);
        }
        next();
    }, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var outgoingEmail, info, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    outgoingEmail = getOutgoingEmail(app.locals.refs, res.locals.data.ref);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, app.locals.transporter.sendMail({
                            from: "\"" + res.locals.data.name + "\" <" + res.locals.data.email + ">",
                            to: outgoingEmail,
                            subject: "You have an enquiry from " + res.locals.data.name,
                            text: "Name: " + res.locals.data.name + "\tEmail: " + res.locals.data.email + "\tMessage: " + res.locals.data.message
                        })];
                case 2:
                    info = _a.sent();
                    res.locals.info = info;
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    next(new StatusError(e_1.message, 500));
                    return [3 /*break*/, 4];
                case 4:
                    next();
                    return [2 /*return*/];
            }
        });
    }); }, function (req, res) {
        res.send();
    }]);
app.use(function (err, req, res, next) {
    if (err) {
        console.error(err.message);
        res.status(err.status).json({ error: { message: err.message, status: err.status } });
    }
    else {
        res.status(200).json({ info: res.locals.info });
        next();
    }
});
app.listen(config_1.default.get("Port"), function () { console.log("Dani senior faas running on port " + config_1.default.get("Port")); });
//# sourceMappingURL=main.js.map