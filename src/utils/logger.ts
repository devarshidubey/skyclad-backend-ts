import winston from "winston";
import { MongoTransport } from "@innova2/winston-mongodb";
import type { TransformableInfo } from "logform";

function getMongoTransport() {
  if(process.env.NODE_ENV === "test") return null;
  return new MongoTransport({
    connectionString: process.env.MONGO_AUDIT_URI!,
    dbName: process.env.MONGO_AUDIT_DB!,
    collectionName: "AuditLog",
    isCollectionCapped: true,
    cappedSize: 100_000_000,
    clientOptions: { maxPoolSize: 10 },
    metaDataToFlatten: ["at", "userId", "action", "entityType", "entityId", "metadata"],
    level: "info",
    format: winston.format((info) => {
      return info.level === "info" ? info : false;
    })(),
  }) as unknown as winston.transport;
}

const flattenLogFormat = winston.format((info: TransformableInfo): boolean | TransformableInfo => {
  if (typeof info.message === "object" && info.message !== null) {
    return { ...info, ...info.message, message: "" };
  }
  return info;
});

const transports: winston.transport[] = [
  new winston.transports.File({ filename: "error.log", level: "error" }),
  new winston.transports.File({ filename: "combined.log", level: "info" }),
];

const mongoTransport = getMongoTransport();
if(mongoTransport) transports.push(mongoTransport);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info", //log only info or above level
    format: winston.format.combine(
      flattenLogFormat(),
      winston.format.json()
    ),
    defaultMeta: {service: 'user-service'},
    transports
})

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;