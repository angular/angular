var name = 'World';
var message = $localize`Hello, ${name}!`;
var other = $localize(__makeTemplateObject(['try', 'me'], ['try', 'me']), 40 + 2);
var customMessage = $localize`:@@custom-id:Custom id message`;
var legacyMessage =
    $localize`:␟1234567890123456789012345678901234567890␟12345678901234567890:Legacy id message`;
var customAndLegacyMessage =
    $localize`:@@custom-id-2␟1234567890123456789012345678901234567890␟12345678901234567890:Custom and legacy message`;
