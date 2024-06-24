import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeSDK, resources } from '@opentelemetry/sdk-node';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const config = {
    enabled: process.env.OTEL_ENABLED === 'true',
    otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
};

if (config.enabled) {
    const sdk = new NodeSDK({
        resource: new resources.Resource({
            [SEMRESATTRS_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'unknown',
        }),
        traceExporter: new OTLPTraceExporter({
            url: config.otlpEndpoint,
        }),
        instrumentations: [
            // reduce noise on auto instrumentation
            getNodeAutoInstrumentations({
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
} else {
    console.log('OpenTelemetry SDK is disabled');
}
