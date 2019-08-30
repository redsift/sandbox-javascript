@0xa9471995234e0b9a;

struct ComputeRequest {
  query @0 :List(Text);
  input @1 :DataQuantum;
  with @2 :DataQuantum;
  get @3 :List(DataQuantum);
}

struct ComputeResponse {
  name @0 :Text;
  key @1 :Text;
  value @2 :List(UInt8);
  epoch @3 :UInt64;
  generation @4 :UInt32;
}

struct Response {
  out @0 :List(ComputeResponse);
  error @1 :List(UInt8);
  stats @2 :List(UInt8);
}

struct RpcRequest {
  remoteAddr @0 :Text;
  method @1 :Text;
  # RequestURI is the unmodified Request-URI of the
  # Request-Line (RFC 2616, Section 5.1) as sent by the client
  # to a server.
  requestUri @2 :Text;
  header @3 :List(Header);
  body @4 :Data;
}

struct RpcResponse {
  # our codes:
  # 500 - We messed up;
  # TODO 502 - Sift messed up;
  # 504 - Sift too slow;
  # TODO 413 - We/Sift can't eat more;
  # 401 - Who are you?;
  # TODO 408 - You're too slow
  statusCode @0 :Int32;
  header @1 :List(Header);
  body @2 :Data;
}

struct HeaderMap {
  entries @0 :List(Header);
}

struct Header {
  key @0 :Text;
  value @1 :List(Text);
}

struct DataQuantum {
  bucket @0 :Text;
  data @1 :List(StoredData);
  key @2 :Text;
}

struct StoredData {
  key @0 :Text;
  value @1 :List(UInt8);
  epoch @2 :Int64;
  generation @3 :UInt32;
}

struct IngrainPayload {
  data @0 :List(SerializedMeasurement);
}

struct SerializedMeasurement {
  timestamp @0 :UInt64;
  kind @1 :UInt16;
  name @2 :Text;
  measurement @3 :Float64;
  tags @4 :List(Tag);
}

struct Tag {
  key @0 :Text;
  value @1 :Text;
}