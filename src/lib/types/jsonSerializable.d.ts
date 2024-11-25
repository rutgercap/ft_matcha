export type JsonSerializable = string | number | boolean | null | JsonArray | JsonObject;

export interface JsonArray extends Array<JsonSerializable> {}

export interface JsonObject {
	[key: string]: JsonSerializable;
}
