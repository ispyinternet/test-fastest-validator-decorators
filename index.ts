/* eslint-disable */
import {
  Email,
  Schema,
  SchemaBase
} from "fastest-validator-decorators";

@Schema("remove")
class Test extends SchemaBase {
  @Email()
  prop!: string;
}
const email = new Test({prop: "test@email.com"})

console.log("email class before validation", email);

const result = email.validate();

console.log("validation result", result);

console.log("email class after validation", email);

