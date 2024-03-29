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
 * @interface NewEventSubscription
 */
export interface NewEventSubscription {
    /**
     * 
     * @type {string}
     * @memberof NewEventSubscription
     */
    topic?: string;
    /**
     * 
     * @type {string}
     * @memberof NewEventSubscription
     */
    subscription?: string;
    /**
     * 
     * @type {string}
     * @memberof NewEventSubscription
     */
    eventId?: string;
    /**
     * 
     * @type {boolean}
     * @memberof NewEventSubscription
     */
    isError?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof NewEventSubscription
     */
    isPreconditionFail?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof NewEventSubscription
     */
    isSuccess?: boolean;
    /**
     * 
     * @type {string}
     * @memberof NewEventSubscription
     */
    traceId?: string;
    /**
     * 
     * @type {any}
     * @memberof NewEventSubscription
     */
    error?: any;
    /**
     * 
     * @type {string}
     * @memberof NewEventSubscription
     */
    createdBy?: string;
    /**
     * 
     * @type {string}
     * @memberof NewEventSubscription
     */
    updatedBy?: string;
}
