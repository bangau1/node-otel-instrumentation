"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const exporter_trace_otlp_http_1 = require("@opentelemetry/exporter-trace-otlp-http");
const api = __importStar(require("@opentelemetry/api"));
const sdk_node_1 = require("@opentelemetry/sdk-node");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const config = {
    enabled: process.env.OTEL_ENABLED === 'true',
    otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
};
if (config.enabled) {
    api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.INFO);
    const sdk = new sdk_node_1.NodeSDK({
        resource: new sdk_node_1.resources.Resource({
            [semantic_conventions_1.SEMRESATTRS_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'unknown',
        }),
        traceExporter: new exporter_trace_otlp_http_1.OTLPTraceExporter({
            url: config.otlpEndpoint,
        }),
        instrumentations: [
            // reduce noise on auto instrumentation
            (0, auto_instrumentations_node_1.getNodeAutoInstrumentations)({
                '@opentelemetry/instrumentation-fs': {
                    enabled: false,
                },
                '@opentelemetry/instrumentation-net': {
                    enabled: false,
                },
                '@opentelemetry/instrumentation-dns': {
                    enabled: false,
                },
                '@opentelemetry/instrumentation-http': {
                    enabled: true,
                },
            }),
        ],
    });
    console.log('OpenTelemetry SDK is starting...');
    console.log(`OTEL_EXPORTER_OTLP_ENDPOINT: ${config.otlpEndpoint}`);
    console.log(`OTEL_SERVICE_NAME: ${process.env.OTEL_SERVICE_NAME || 'unknown'}`);
    sdk.start();
    // Graceful shutdown (optional)
    process.on('SIGTERM', () => {
        sdk.shutdown().then(() => {
            console.log('OpenTelemetry SDK shut down successfully.');
            process.exit(0);
        });
    });
}
else {
    console.log('OpenTelemetry SDK is disabled');
}
//# sourceMappingURL=index.js.map