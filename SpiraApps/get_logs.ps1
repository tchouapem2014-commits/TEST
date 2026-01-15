$headers = @{
    'username' = 'administrator'
    'api-key' = '{55F6ED62-7D81-49AB-A0FC-D5615C663D17}'
    'Content-Type' = 'application/json'
}

# L'API attend un array vide pour pas de filtre
$body = "[]"

$result = Invoke-RestMethod -Uri 'https://demo-in.spiraservice.net/mtx/Services/v7_0/RestService.svc/system/events/search?starting_row=1&number_of_rows=30' -Method POST -Headers $headers -Body $body
$result | ConvertTo-Json -Depth 5
