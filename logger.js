import pino from "pino"
import pino_pretty from "pino-pretty"

function create_logger(msgPrefix = "", color = "white") {
  const logger = pino(
    {
      msgPrefix: msgPrefix ? `[${msgPrefix}] ` : "",
      level: "debug",
    },
    pino_pretty({
      colorize: true,
      ignore: "hostname,pid",
      messageFormat: (log, messageKey, levelLabel, { colors }) => {
        return `\n\t${colors[color](log[messageKey])}`
      },
    })
  )
  logger.info("logger initialized")
  return logger
}

export default create_logger
