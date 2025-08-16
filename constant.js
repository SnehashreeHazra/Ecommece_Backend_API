const constants={
    VALIDATION_ERROR:400,
    UNAUTHORIZED:401,
    VALUE_EXISTS:402,
    FORBIDDEN:403,
    NOT_FOUND:404,
    SERVER_ERROR:500
}

const ROLE_LIST={
    "Admin":5300,
    "Vendor":5400,
    "User":5100
}

module.exports={constants,ROLE_LIST}