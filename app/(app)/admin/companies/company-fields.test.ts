import { describe, expect, it } from "vitest";
import {
  type CompanyFormFields,
  validateCompanyFields,
} from "./company-fields";

function fields(
  overrides: Partial<CompanyFormFields> = {},
): CompanyFormFields {
  return {
    name: "Acme Ltd",
    addressLine1: "",
    addressLine2: "",
    townCity: "",
    countyState: "",
    postcodeZip: "",
    country: "",
    billingRate: "100",
    ...overrides,
  };
}

describe("validateCompanyFields", () => {
  it("rejects a company with an empty name", () => {
    expect(validateCompanyFields(fields({ name: "" }))).toEqual({
      error: "Company name is required",
    });
  });

  it("accepts a positive integer billing rate", () => {
    expect(validateCompanyFields(fields({ billingRate: "50" }))).toEqual({
      data: {
        name: "Acme Ltd",
        addressLine1: null,
        addressLine2: null,
        townCity: null,
        countyState: null,
        postcodeZip: null,
        country: null,
        billingRate: "50",
      },
    });
  });

  it("rejects a negative billing rate", () => {
    expect(validateCompanyFields(fields({ billingRate: "-40" }))).toEqual({
      error: "Billing rate must be a number with up to 2 decimal places",
    });
  });

  it("rejects a billing rate that has more than 2 decimal places", () => {
    expect(validateCompanyFields(fields({ billingRate: "49.999" }))).toEqual({
      error: "Billing rate must be a number with up to 2 decimal places",
    });
  });

  it("rejects an unsupported country", () => {
    expect(validateCompanyFields(fields({ country: "FakeCountry" }))).toEqual({
      error: "Select a valid country",
    });
  });
});
