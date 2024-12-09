import amqp, { Channel, Connection } from "amqplib";
import config from "../config/config";

class RabbitMQService {
  private requestQueue = "MSQ_REQUEST";
  private responseQueue = "MSQ_RESPONSE";
  private sendSMSQueue = 'QUEUE_SEND_SMS';
  private sendEmailQueue = 'QUEUE_SEND_MAIL';
  private pushNotificationQueue = 'QUEUE_PUSH_NOTIF';
  private connection!: Connection;
  private channel!: Channel;

  constructor() {
    this.init();
  }

  async init() {
    // Establish connection to RabbitMQ server
    this.connection = await amqp.connect(config.msgBrokerURL);
    this.channel = await this.connection.createChannel();
    this.channel.assertExchange('1234', 'direct', {
      durable: false
    });
    // Start listening for messages on the request queue
    // this.consumeQueueBName(this.sendSMSQueue);
    // this.consumeQueueBName(this.sendEmailQueue);
    // this.consumeQueueBName(this.pushNotificationQueue);
    this.consumeSMS();
    this.consumeEmail();
    this.consumeNotification();
    this.consumeNotificationByKey();
  }

  async consumeQueueBName(queueName: string) {
    await this.channel.assertQueue(queueName, { durable: true });
    this.channel.consume(queueName, async (msg) => {
      console.log('MESSAGE 11', msg?.content.toString())
      if (msg) {
        // Acknowledge the processed message
        this.channel.ack(msg);
      }
    });
  }

  async consumeSMS() {
    await this.channel.assertQueue(this.sendSMSQueue, { durable: true });
    this.channel.consume(this.sendSMSQueue, async (msg) => {
      if (msg) {
        console.log('QUEUE_SMS...', msg?.content.toString())
        // Acknowledge the processed message
        this.channel.ack(msg);
      }
    })
  }

  async consumeEmail() {
    await this.channel.assertQueue(this.sendEmailQueue, { durable: true });
    this.channel.consume(this.sendEmailQueue, async (msg) => {
      if (msg) {
        console.log('QUEUE_EMAIL...', msg?.content.toString())
        // Acknowledge the processed message
        this.channel.ack(msg);
      }
    })
  }

  async consumeNotification() {
    await this.channel.assertQueue(this.pushNotificationQueue, { durable: true });
    this.channel.consume(this.pushNotificationQueue, async (msg) => {
      if (msg) {
        console.log('QUEUE_NOTIFICATION...', msg?.content.toString())
        // Acknowledge the processed message
        this.channel.ack(msg);
      }
    })
  }

  async consumeNotificationByKey() {
    await this.channel.assertQueue('', { durable: true });
    await this.channel.bindQueue('', '1234', 'hoangpc'),
    this.channel.consume('', async (msg) => {
      if (msg) {
        console.log('QUEUE_NONE...', msg?.content.toString().toString())
        // Acknowledge the processed message
        this.channel.ack(msg);
      }
    })
  }
}

export const rabbitMQService = new RabbitMQService();