# Test des endpoints API Spira
$baseUrl = "https://demo-in.spiraservice.net/mtx/Services/v7_0/RestService.svc"
$headers = @{
    "accept" = "application/json"
    "Content-Type" = "application/json"
    "api-key" = "{55F6ED62-7D81-49AB-A0FC-D5615C663D17}"
    "username" = "administrator"
}

Write-Host "=== Test 1a: POST /projects/1/tasks SANS query params ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/projects/1/tasks" -Method POST -Headers $headers -Body "[]"
    Write-Host "SUCCESS: $($response.Count) taches recues" -ForegroundColor Green
    if ($response.Count -gt 0) {
        Write-Host "Premiere tache: TaskId=$($response[0].TaskId), Name=$($response[0].Name)"
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
}

Write-Host ""
Write-Host "=== Test 1b: POST /projects/1/tasks avec RemoteFilter ===" -ForegroundColor Cyan
try {
    $filters = @(
        @{
            PropertyName = "TaskStatusId"
            IntValue = 1
        }
    )
    $body = $filters | ConvertTo-Json
    Write-Host "Body: $body"
    $response = Invoke-RestMethod -Uri "$baseUrl/projects/1/tasks?starting_row=0&number_of_rows=10" -Method POST -Headers $headers -Body $body
    Write-Host "SUCCESS: $($response.Count) taches recues" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test 2: GET /projects/1/tasks/50 (tache specifique) ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/projects/1/tasks/50" -Method GET -Headers $headers
    Write-Host "SUCCESS: TaskId=$($response.TaskId), Name=$($response.Name)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test 3: GET /projects/1/tasks/count ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/projects/1/tasks/count" -Method GET -Headers $headers
    Write-Host "SUCCESS: $response taches dans le projet" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test 4: GET /tasks (taches de l'utilisateur) ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tasks" -Method GET -Headers $headers
    Write-Host "SUCCESS: $($response.Count) taches pour l'utilisateur" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test 5a: GET /projects/1/tasks/new (format ISO) ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/projects/1/tasks/new/2020-01-01T00:00:00/0/100" -Method GET -Headers $headers
    Write-Host "SUCCESS: $($response.Count) taches recues" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test 5b: Iteration sur tous les IDs de taches ===" -ForegroundColor Cyan
try {
    $taskCount = Invoke-RestMethod -Uri "$baseUrl/projects/1/tasks/count" -Method GET -Headers $headers
    Write-Host "Il y a $taskCount taches. Recuperation des 5 premieres..."
    $tasks = @()
    for ($i = 1; $i -le 5; $i++) {
        try {
            $task = Invoke-RestMethod -Uri "$baseUrl/projects/1/tasks/$i" -Method GET -Headers $headers
            $tasks += $task
            Write-Host "  Task $i : $($task.Name)"
        } catch {
            # Task might not exist with this ID
        }
    }
    Write-Host "SUCCESS: $($tasks.Count) taches recuperees par iteration" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test 6: GET details de la task 1 ===" -ForegroundColor Cyan
try {
    $task = Invoke-RestMethod -Uri "$baseUrl/projects/1/tasks/1" -Method GET -Headers $headers
    Write-Host "Task 1 details:" -ForegroundColor Green
    Write-Host "  Name: $($task.Name)"
    Write-Host "  OwnerId: $($task.OwnerId)"
    Write-Host "  StartDate: $($task.StartDate)"
    Write-Host "  EndDate: $($task.EndDate)"
    Write-Host "  TaskStatusId: $($task.TaskStatusId)"
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test 7: PUT update task (objet complet) ===" -ForegroundColor Cyan
try {
    # Recuperer la tache complete
    $task = Invoke-RestMethod -Uri "$baseUrl/projects/1/tasks/50" -Method GET -Headers $headers
    Write-Host "Task avant update: Name=$($task.Name)"

    # Renvoyer l'objet complet tel quel (sans modification)
    $updateBody = $task | ConvertTo-Json -Depth 10

    Write-Host "Envoi de l'objet complet..."
    $response = Invoke-RestMethod -Uri "$baseUrl/projects/1/tasks" -Method PUT -Headers $headers -Body $updateBody
    Write-Host "SUCCESS: Task mise a jour" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test 8: GET associations pour Task 1 (ArtifactTypeId=6) ===" -ForegroundColor Cyan
try {
    # ArtifactTypeId 6 = Task
    $response = Invoke-RestMethod -Uri "$baseUrl/projects/1/associations/6/1" -Method GET -Headers $headers
    Write-Host "SUCCESS: $($response.Count) associations trouvees" -ForegroundColor Green
    if ($response.Count -gt 0) {
        $response | ForEach-Object {
            Write-Host "  LinkId=$($_.ArtifactLinkId) Type=$($_.ArtifactLinkTypeId) -> $($_.DestArtifactTypeName) $($_.DestArtifactId)"
        }
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test 9: POST creer association Task1 -> Task2 ===" -ForegroundColor Cyan
try {
    $association = @{
        SourceArtifactId = 1
        SourceArtifactTypeId = 6  # Task
        DestArtifactId = 2
        DestArtifactTypeId = 6   # Task
        ArtifactLinkTypeId = 2   # Depends-on
        Comment = "SmartTasks|FS|0"  # Type FS, Lag 0
    }
    $body = $association | ConvertTo-Json
    Write-Host "Body: $body"
    $response = Invoke-RestMethod -Uri "$baseUrl/projects/1/associations" -Method POST -Headers $headers -Body $body
    Write-Host "SUCCESS: Association creee, LinkId=$($response.ArtifactLinkId)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test 10: PUT task avec objet GET complet re-envoye ===" -ForegroundColor Cyan
try {
    # Recuperer la tache complete (Task 1 qui a des dates)
    $task = Invoke-RestMethod -Uri "$baseUrl/projects/1/tasks/1" -Method GET -Headers $headers
    Write-Host "Task originale: Name=$($task.Name), StartDate=$($task.StartDate)"

    # Modifier uniquement EndDate
    $newEndDate = (Get-Date $task.EndDate).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    $task.EndDate = $newEndDate

    $body = $task | ConvertTo-Json -Depth 10
    Write-Host "Envoi de l'objet complet modifie..."
    $response = Invoke-RestMethod -Uri "$baseUrl/projects/1/tasks" -Method PUT -Headers $headers -Body $body
    Write-Host "SUCCESS: Task mise a jour" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host "Details: $($reader.ReadToEnd())"
        } catch {}
    }
}

Write-Host ""
Write-Host "=== Test 11: Afficher structure complete d'une task ===" -ForegroundColor Cyan
try {
    $task = Invoke-RestMethod -Uri "$baseUrl/projects/1/tasks/1" -Method GET -Headers $headers
    Write-Host "Structure complete de Task 1:" -ForegroundColor Green
    $task | ConvertTo-Json -Depth 10
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
