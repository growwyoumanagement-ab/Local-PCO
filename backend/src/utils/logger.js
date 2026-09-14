// src/utils/logger.js
// Structured logger with daily log rotation to prevent disk exhaustion.
// Logs are archived, gzipped, and deleted after 14 days automatically.

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        // Error-level only, rotated daily, max 20MB per file, kept 14 days
        new DailyRotateFile({
            filename: path.join(logsDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        }),
        // All levels combined, same rotation policy
        new DailyRotateFile({
            filename: path.join(logsDir, 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        })
    ]
});

// Console transport: Always log to stdout/stderr so cloud platforms like Render can capture live logs
logger.add(new winston.transports.Console({
    format: process.env.NODE_ENV === 'production'
        ? winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        )
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, stack }) => {
                return stack
                    ? `${timestamp} [${level}]: ${message}\n${stack}`
                    : `${timestamp} [${level}]: ${message}`;
            })
        )
}));

module.exports = logger;
