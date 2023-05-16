/* eslint-disable */
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "jellyfish.peer";

export interface ControlMessage {
  authenticated?: ControlMessage_Authenticated | undefined;
  authRequest?: ControlMessage_AuthRequest | undefined;
  mediaEvent?: ControlMessage_MediaEvent | undefined;
}

export interface ControlMessage_Authenticated {}

export interface ControlMessage_AuthRequest {
  token: string;
}

export interface ControlMessage_MediaEvent {
  data: string;
}

function createBaseControlMessage(): ControlMessage {
  return { authenticated: undefined, authRequest: undefined, mediaEvent: undefined };
}

export const ControlMessage = {
  encode(message: ControlMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.authenticated !== undefined) {
      ControlMessage_Authenticated.encode(message.authenticated, writer.uint32(10).fork()).ldelim();
    }
    if (message.authRequest !== undefined) {
      ControlMessage_AuthRequest.encode(message.authRequest, writer.uint32(18).fork()).ldelim();
    }
    if (message.mediaEvent !== undefined) {
      ControlMessage_MediaEvent.encode(message.mediaEvent, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ControlMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseControlMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.authenticated = ControlMessage_Authenticated.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.authRequest = ControlMessage_AuthRequest.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.mediaEvent = ControlMessage_MediaEvent.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ControlMessage {
    return {
      authenticated: isSet(object.authenticated)
        ? ControlMessage_Authenticated.fromJSON(object.authenticated)
        : undefined,
      authRequest: isSet(object.authRequest) ? ControlMessage_AuthRequest.fromJSON(object.authRequest) : undefined,
      mediaEvent: isSet(object.mediaEvent) ? ControlMessage_MediaEvent.fromJSON(object.mediaEvent) : undefined,
    };
  },

  toJSON(message: ControlMessage): unknown {
    const obj: any = {};
    message.authenticated !== undefined &&
      (obj.authenticated = message.authenticated
        ? ControlMessage_Authenticated.toJSON(message.authenticated)
        : undefined);
    message.authRequest !== undefined &&
      (obj.authRequest = message.authRequest ? ControlMessage_AuthRequest.toJSON(message.authRequest) : undefined);
    message.mediaEvent !== undefined &&
      (obj.mediaEvent = message.mediaEvent ? ControlMessage_MediaEvent.toJSON(message.mediaEvent) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<ControlMessage>, I>>(base?: I): ControlMessage {
    return ControlMessage.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ControlMessage>, I>>(object: I): ControlMessage {
    const message = createBaseControlMessage();
    message.authenticated =
      object.authenticated !== undefined && object.authenticated !== null
        ? ControlMessage_Authenticated.fromPartial(object.authenticated)
        : undefined;
    message.authRequest =
      object.authRequest !== undefined && object.authRequest !== null
        ? ControlMessage_AuthRequest.fromPartial(object.authRequest)
        : undefined;
    message.mediaEvent =
      object.mediaEvent !== undefined && object.mediaEvent !== null
        ? ControlMessage_MediaEvent.fromPartial(object.mediaEvent)
        : undefined;
    return message;
  },
};

function createBaseControlMessage_Authenticated(): ControlMessage_Authenticated {
  return {};
}

export const ControlMessage_Authenticated = {
  encode(_: ControlMessage_Authenticated, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ControlMessage_Authenticated {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseControlMessage_Authenticated();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): ControlMessage_Authenticated {
    return {};
  },

  toJSON(_: ControlMessage_Authenticated): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<ControlMessage_Authenticated>, I>>(base?: I): ControlMessage_Authenticated {
    return ControlMessage_Authenticated.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ControlMessage_Authenticated>, I>>(_: I): ControlMessage_Authenticated {
    const message = createBaseControlMessage_Authenticated();
    return message;
  },
};

function createBaseControlMessage_AuthRequest(): ControlMessage_AuthRequest {
  return { token: "" };
}

export const ControlMessage_AuthRequest = {
  encode(message: ControlMessage_AuthRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.token !== "") {
      writer.uint32(10).string(message.token);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ControlMessage_AuthRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseControlMessage_AuthRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.token = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ControlMessage_AuthRequest {
    return { token: isSet(object.token) ? String(object.token) : "" };
  },

  toJSON(message: ControlMessage_AuthRequest): unknown {
    const obj: any = {};
    message.token !== undefined && (obj.token = message.token);
    return obj;
  },

  create<I extends Exact<DeepPartial<ControlMessage_AuthRequest>, I>>(base?: I): ControlMessage_AuthRequest {
    return ControlMessage_AuthRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ControlMessage_AuthRequest>, I>>(object: I): ControlMessage_AuthRequest {
    const message = createBaseControlMessage_AuthRequest();
    message.token = object.token ?? "";
    return message;
  },
};

function createBaseControlMessage_MediaEvent(): ControlMessage_MediaEvent {
  return { data: "" };
}

export const ControlMessage_MediaEvent = {
  encode(message: ControlMessage_MediaEvent, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.data !== "") {
      writer.uint32(10).string(message.data);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ControlMessage_MediaEvent {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseControlMessage_MediaEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.data = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ControlMessage_MediaEvent {
    return { data: isSet(object.data) ? String(object.data) : "" };
  },

  toJSON(message: ControlMessage_MediaEvent): unknown {
    const obj: any = {};
    message.data !== undefined && (obj.data = message.data);
    return obj;
  },

  create<I extends Exact<DeepPartial<ControlMessage_MediaEvent>, I>>(base?: I): ControlMessage_MediaEvent {
    return ControlMessage_MediaEvent.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ControlMessage_MediaEvent>, I>>(object: I): ControlMessage_MediaEvent {
    const message = createBaseControlMessage_MediaEvent();
    message.data = object.data ?? "";
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
