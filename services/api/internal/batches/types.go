package batches

import "time"

type Summary struct {
	TotalBatches         int `json:"total_batches"`
	ActiveBatches        int `json:"active_batches"`
	AnimalsReceived      int `json:"animals_received"`
	AnimalsSlaughtered   int `json:"animals_slaughtered"`
	HalalVerifiedBatches int `json:"halal_verified_batches"`
}

type HalalSummary struct {
	Checks  int `json:"checks"`
	Pass    int `json:"pass"`
	Fail    int `json:"fail"`
	Pending int `json:"pending"`
}

type MeatOutput struct {
	ID          string    `json:"id"`
	BatchNo     string    `json:"batch_no"`
	Quantity    float64   `json:"quantity"`
	Unit        string    `json:"unit"`
	ProducedAt  time.Time `json:"produced_at"`
	Status      string    `json:"status"`
	HalalStatus string    `json:"halal_status"`
}

type Batch struct {
	ID               string       `json:"id"`
	BatchNo          string       `json:"batch_no"`
	SpeciesCode      string       `json:"species_code"`
	SupplierName     string       `json:"supplier_name"`
	AnimalCount      int          `json:"animal_count"`
	SlaughteredCount int          `json:"slaughtered_count"`
	RemainingCount   int          `json:"remaining_count"`
	Status           string       `json:"status"`
	ReceivedAt       time.Time    `json:"received_at"`
	CreatedAt        time.Time    `json:"created_at"`
	Halal            HalalSummary `json:"halal"`
	Carcasses        int          `json:"carcasses"`
	MeatOutputs      []MeatOutput `json:"meat_outputs"`
}

type Response struct {
	Data ResponseData `json:"data"`
	Meta Meta         `json:"meta"`
}

type ResponseData struct {
	Summary Summary `json:"summary"`
	Items   []Batch `json:"items"`
}

type Meta struct {
	Status string `json:"status"`
}
