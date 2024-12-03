import amqp, { Channel, Connection } from "amqplib";
import config from "../config/config";

class RabbitMQService {
  private requestQueue = "MSQ_REQUEST";
  private responseQueue = "MSQ_RESPONSE";
  private connection!: Connection;
  private channel!: Channel;

  constructor() {
    this.init();
  }

  async init() {
    // Establish connection to RabbitMQ server
    this.connection = await amqp.connect(config.msgBrokerURL!);
    this.channel = await this.connection.createChannel();

    // Asserting queues ensures they exist
    await this.channel.assertQueue(this.requestQueue, { durable: true });
    await this.channel.assertQueue(this.responseQueue, { durable: true });

    // Start listening for messages on the request queue
    this.listenForRequests();
  }

  private async listenForRequests() {
    this.channel.consume(this.requestQueue, async (msg) => {
      if (msg && msg.content) {
        console.log('MS...received', msg)
        // Send the user details response
        this.channel.sendToQueue(
          this.responseQueue,
          Buffer.from(JSON.stringify({ msg: msg })),
          {
            correlationId: msg.properties.correlationId,
            persistent: true  // make sure msg won't be lost even RMQ restart (RMQ will save msg to disk in advanced)
          }
        );
        console.log(" [x] Sent %s", msg);
        // Acknowledge the processed message
        this.channel.ack(msg);
      }
    });
  }
}

export const rabbitMQService = new RabbitMQService();