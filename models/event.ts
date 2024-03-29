/* tslint:disable */
/* eslint-disable */
/**
 * Tutor
 * Event Manager Backend service is based on Strapi v3 JS framework.
 *
 * OpenAPI spec version: 1.0.0
 * Contact: aram@dasmeta.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
/**
 * 
 * @export
 * @interface Event
 */
export interface Event {
    /**
     * 
     * @type {string}
     * @memberof Event
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof Event
     */
    traceId?: string;
    /**
     * 
     * @type {string}
     * @memberof Event
     */
    topic?: string;
    /**
     * 
     * @type {string}
     * @memberof Event
     */
    dataSource?: string;
    /**
     * 
     * @type {string}
     * @memberof Event
     */
    entity?: string;
    /**
     * 
     * @type {string}
     * @memberof Event
     */
    entityId?: string;
    /**
     * 
     * @type {string}
     * @memberof Event
     */
    messageId?: string;
    /**
     * 
     * @type {any}
     * @memberof Event
     */
    data?: any;
}
