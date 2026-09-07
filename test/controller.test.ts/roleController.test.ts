import { expect } from "chai";
import sinon from "sinon";

import * as roleController from "../../src/controller/roleController.js";
import { ROLES } from "../../src/config/config.js";

describe("Role Controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {};

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("getAllRoles()", () => {
    it("should get all roles successfully", async () => {
      await roleController.getAllRoles(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Roles fetched successfully"
      );

      expect(response.data).to.deep.equal(ROLES);
    });

    it("should return all roles from ROLES constant", async () => {
      await roleController.getAllRoles(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.data).to.equal(ROLES);
    });

    it("should return roles as an array", async () => {
      await roleController.getAllRoles(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.data).to.be.an("array");
    });

    it("should return correct success message", async () => {
      await roleController.getAllRoles(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Roles fetched successfully"
      );
    });
  });
});