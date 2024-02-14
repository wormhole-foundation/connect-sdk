import { BN } from '@project-serum/anchor';

export class EndpointMessage<A> {
  static prefix: Buffer;
  managerPayload: ManagerMessage<A>;

  constructor(managerPayload: ManagerMessage<A>) {
    this.managerPayload = managerPayload;
  }

  static deserialize<A>(
    data: Buffer,
    deserializer: (data: Buffer) => ManagerMessage<A>,
  ): EndpointMessage<A> {
    if (this.prefix == undefined) {
      throw new Error('Unknown prefix.');
    }
    const prefix = data.subarray(0, 4);
    if (!prefix.equals(this.prefix)) {
      throw new Error('Invalid prefix');
    }
    const managerPayloadLen = data.readUInt16BE(4);
    const managerPayload = deserializer(
      data.subarray(6, 6 + managerPayloadLen),
    );
    return new EndpointMessage(managerPayload);
  }

  static serialize<A>(
    msg: EndpointMessage<A>,
    serializer: (payload: ManagerMessage<A>) => Buffer,
  ): Buffer {
    const payload = serializer(msg.managerPayload);
    const buffer = Buffer.concat([
      this.prefix,
      new BN(payload.length).toBuffer('be', 2),
      payload,
    ]);
    return buffer;
  }
}

export class ManagerMessage<A> {
  chainId: number;
  sequence: bigint;
  sourceManager: Buffer;
  sender: Buffer;
  payload: A;

  constructor(
    chainId: number,
    sequence: bigint,
    sourceManager: Buffer,
    sender: Buffer,
    payload: A,
  ) {
    this.chainId = chainId;
    this.sequence = sequence;
    this.sourceManager = sourceManager;
    this.sender = sender;
    this.payload = payload;
  }

  static deserialize = <A>(
    data: Buffer,
    deserializer: (data: Buffer) => A,
  ): ManagerMessage<A> => {
    const chainId = data.readUInt16BE(0);
    const sequence = data.readBigUInt64BE(2);
    const sourceManager = data.subarray(10, 42);
    const sender = data.subarray(42, 74);
    const payloadLen = data.readUint16BE(74);
    const payload = deserializer(data.subarray(76, 76 + payloadLen));
    return new ManagerMessage(
      chainId,
      sequence,
      sourceManager,
      sender,
      payload,
    );
  };

  static serialize = <A>(
    msg: ManagerMessage<A>,
    serializer: (payload: A) => Buffer,
  ): Buffer => {
    const buffer = Buffer.alloc(74);
    buffer.writeUInt16BE(msg.chainId, 0);
    buffer.writeBigUInt64BE(msg.sequence, 2);
    buffer.set(msg.sourceManager, 10);
    buffer.set(msg.sender, 42);
    const payload = serializer(msg.payload);
    return Buffer.concat([
      buffer,
      new BN(payload.length).toBuffer('be', 2),
      payload,
    ]);
  };
}
