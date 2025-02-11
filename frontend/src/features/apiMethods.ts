/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

/**
 * File name: apiMethods.ts
 * Task - It contains the wrapper methods for http get and post request. Have added the wrapper methods so that
 * the code to hit the API would be at one place and could be imported to be used at multiple places.
 * @author Priyanka Ambawane - dearpriyankasa@gmail.com
 */

export interface ActionTypes {
    type: string;
    payload: any;
}

export const httpGetRequest = async (apiURL: string) => {
    try {
        // 👇️ const response: Response
        const response = await fetch(apiURL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Request-Method': 'GET'
          }
        });
    
        if (!response.ok) {
          throw new Error(`Error! status: ${response.status}`);
        }
    
        const result = (await response.json()) as any;
        return result;
      } catch (error) {
        if (error instanceof Error) {
          console.log('error message: ', error.message);
          return error.message;
        } else {
          console.log('unexpected error: ', error);
          return 'An unexpected error occurred';
        }
      }
}

export const httpPostRequest = async (apiURL: string, requestBody: any) => {
    try {
        // 👇️ const response: Response
        const response = await fetch(apiURL, {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Request-Method': 'POST'
          }
        });
    
        if (!response.ok) {
          throw new Error(`Error! status: ${response.status}`);
        }
    
        const result = (await response.json()) as any;
    
        return result;
      } catch (error) {
        if (error instanceof Error) {
          console.log('error message: ', error.message);
          return error.message;
        } else {
          console.log('unexpected error: ', error);
          return 'An unexpected error occurred';
        }
      }
}