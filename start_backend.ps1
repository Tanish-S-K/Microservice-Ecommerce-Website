# ShopNest Microservices Startup Script
# This script opens each service in a separate maximized PowerShell window.

$services = @(
    @{ Name = "Product Service"; Path = "backend\product-service"; Port = 8082 },
    @{ Name = "User Service"; Path = "backend\user-service"; Port = 8081 },
    @{ Name = "Cart Service"; Path = "backend\cart-service"; Port = 8083 },
    @{ Name = "Payment Service"; Path = "backend\payment-service"; Port = 8084 },
    @{ Name = "Recommendation Service"; Path = "backend\recommendation-service"; Port = 8085 },
    @{ Name = "API Gateway"; Path = "backend\api-gateway"; Port = 8080 }
)

Write-Host "Starting ShopNest Microservices..." -ForegroundColor Cyan

foreach ($service in $services) {
    Write-Host "Launching $($service.Name) on port $($service.Port)..." -ForegroundColor Yellow
    # Start Maven in a new window with JDK 21
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME='C:\Users\Tanis\.jdks\ms-21.0.10'; `$env:PATH=`$env:JAVA_HOME + '\bin;' + `$env:PATH; Write-Host 'Starting $($service.Name)...'; cd '$($service.Path)'; mvn spring-boot:run" -WindowStyle Maximized
    # Pause briefly to avoid CPU spike
    Start-Sleep -Seconds 2
}

Write-Host "All 6 services have been launched in separate windows." -ForegroundColor Green
Write-Host "Please wait for them to finish booting (usually takes 15-30 seconds)." -ForegroundColor Green
