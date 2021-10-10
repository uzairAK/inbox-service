var axios = require("axios");
var public_api = "https://oneid.veevotech.com/service_api/";
var private_api = "http://172.18.0.31/one_id/service_api/";

async function getUser(arr) {
    try {
        const response = await axios.get(private_api+'find_users', {
            params: {
                "username_array": JSON.stringify(arr)
            }
        })
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                // console.log(error);
            })
            // .then(function () {
            //     // always executed
            // });
        return response;
    } catch (error) {
        console.error(error);
    }
};

module.exports = (arr) => getUser(arr);