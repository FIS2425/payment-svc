import winston from 'winston';
import { KafkaClient, Producer } from 'kafka-node';

class KafkaTransport extends winston.Transport {
  constructor(opts) {
    super(opts);

    this.client = new KafkaClient({ kafkaHost: opts.kafkaHost || process.env.KAFKA_HOST });
    this.producer = new Producer(this.client);

    this.topic = opts.topic || 'logs';
    this.producer.on('ready', () => console.log('Kafka producer is ready'));
    this.producer.on('error', (err) => console.error('Kafka producer error:', err));
  }

  async log(info, _callback) {
    const message = {
      value: JSON.stringify({ ...info })
    };

    const payloads = [{ topic: this.topic, messages: message }];

    // Send the log to Kafka
    try {
      await this.producer.connect();
      await this.producer.send(payloads);
      await this.producer.disconnect();
    } catch { }
  }
}

export default KafkaTransport;
