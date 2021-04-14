const controllerAddr = "localhost"
const controllerPort = "7080"

export const properties = {
    mode : "ISSUER",
    // mode : "VERIFIER"
    getSchemasByIdUrl : 'http://' + controllerAddr + ':' + controllerPort + '/issuer/schemasById/',
    getSchemasUrl : 'http://' + controllerAddr + ':' + controllerPort + '/issuer/schemas/',
    postRegisterNewSchemaWithDuplicationCheckUrl : 'http://' + controllerAddr + ':' + controllerPort + '/issuer/register-new-schema-with-duplication-check/',
    getCredentialDefinitionsUrl : 'http://' + controllerAddr + ':' + controllerPort + '/issuer/credentialDefinitions/',
    getCredentialDefinitionByIdUrl : 'http://' + controllerAddr + ':' + controllerPort + '/issuer/credentialDefinitionById/',
    postCredentialDefinitionUrl : 'http://' + controllerAddr + ':' + controllerPort + '/issuer/credentialDefinition/',
};