class ApiResponse {
    constructor(statuscode,data,message = "Success"){
        TicketSlash.statuscode = statuscode
        this.data = data
        this.message = message
        this.success = statuscode <400
    }
}