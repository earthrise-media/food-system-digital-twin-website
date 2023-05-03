import { withSwagger } from "next-swagger-doc";
import nextSwaggerDocSpec from "../../../next-swagger-doc.json";

/**
 * This file is used to generate the swagger documentation for the API, and includes the following tags and components that are reused across the API.
 *
 */

/**
 * @swagger
 *
 * tags:
 *   - name: counties
 *     description: Counties
 *   - name: flows
 *     description: Flows
 *   - name: routes
 *     description: Routes
 *
 *
 * components:
 *
 *   parameters:
 *
 *    CountyId:
 *     name: countyId
 *     in: path
 *     description: County ID
 *     required: true
 *     schema:
 *       type: integer
 *       format: int64
 *
 *   schemas:
 *     County:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           example: 123
 *         name:
 *           type: string
 *           example: "Dayton, OH"
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           description: total number of records
 *           example: 55
 *           format: int64
 *           type: integer
 *         perPage:
 *           description: number of records per page
 *           example: 10
 *           format: int64
 *           type: integer
 *         lastPage:
 *           description: last page index
 *           example: 6
 *           format: int64
 *           type: integer
 *         currentPage:
 *           description: last page index
 *           example: 2
 *           format: int64
 *           type: integer
 *         from:
 *           description: index of first item in the page
 *           example: 11
 *           format: int64
 *           type: integer
 *         to:
 *           description: index of last item in the page
 *           example: 20
 *           format: int64
 *           type: integer
 *
 */

const swaggerHandler = withSwagger(nextSwaggerDocSpec);
export default swaggerHandler();
