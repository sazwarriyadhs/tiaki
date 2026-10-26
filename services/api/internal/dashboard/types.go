package dashboard

type Summary struct {
	Sites          SitesSummary          `json:"sites"`
	Equipment      EquipmentSummary      `json:"equipment"`
	Temperature    TemperatureSummary    `json:"temperature"`
	Halal          HalalSummary          `json:"halal"`
	Certifications CertificationSummary  `json:"certifications"`
	Alerts         AlertsSummary         `json:"alerts"`
	AIRisk         AIRiskSummary         `json:"ai_risk"`
	Operations     OperationsSummary     `json:"operations"`
	PostMortem     PostMortemSummary     `json:"post_mortem"`
	Carcasses      CarcassSummary        `json:"carcasses"`
	MeatProduction MeatProductionSummary `json:"meat_production"`
}

type SitesSummary struct {
	Total  int64 `json:"total"`
	Active int64 `json:"active"`
}

type EquipmentSummary struct {
	Total  int64 `json:"total"`
	Active int64 `json:"active"`
}

type TemperatureSummary struct {
	Sensors        int64    `json:"sensors"`
	ReadingsToday  int64    `json:"readings_today"`
	ExcursionsOpen int64    `json:"excursions_open"`
	LatestAverageC *float64 `json:"latest_average_c"`
}

type HalalSummary struct {
	ComplianceRate *float64 `json:"compliance_rate"`
	ChecksToday    int64    `json:"checks_today"`
	Pass           int64    `json:"pass"`
	Fail           int64    `json:"fail"`
	Pending        int64    `json:"pending"`
}

type CertificationSummary struct {
	Active    int64 `json:"active"`
	Expiring  int64 `json:"expiring"`
	Suspended int64 `json:"suspended"`
	Pending   int64 `json:"pending"`
}

type AlertsSummary struct {
	Open     int64 `json:"open"`
	Critical int64 `json:"critical"`
}

type AIRiskSummary struct {
	Score *float64 `json:"score"`
}

type OperationsSummary struct {
	ArrivalsToday          int64    `json:"arrivals_today"`
	LivestockReceivedToday int64    `json:"livestock_received_today"`
	SlaughteredToday       int64    `json:"slaughtered_today"`
	ActiveSessions         int64    `json:"active_sessions"`
	PlannedToday           int64    `json:"planned_today"`
	AvgProcessMinutes      *float64 `json:"avg_process_minutes"`
}

type PostMortemSummary struct {
	Passed      int64 `json:"passed"`
	Held        int64 `json:"held"`
	Rejected    int64 `json:"rejected"`
	Conditional int64 `json:"conditional"`
}

type CarcassSummary struct {
	ProducedToday int64    `json:"produced_today"`
	WeightToday   *float64 `json:"weight_today"`
	Pending       int64    `json:"pending"`
	Supported     int64    `json:"supported"`
	Held          int64    `json:"held"`
	Rejected      int64    `json:"rejected"`
}

type MeatProductionSummary struct {
	BatchesToday  int64    `json:"batches_today"`
	QuantityToday *float64 `json:"quantity_today"`
	Unit          string   `json:"unit"`
}

type SummaryResponse struct {
	Data SummaryResponseData `json:"data"`
	Meta SummaryMeta         `json:"meta"`
}

type SummaryResponseData struct {
	Sites          SitesSummary          `json:"sites"`
	Equipment      EquipmentSummary      `json:"equipment"`
	Temperature    TemperatureSummary    `json:"temperature"`
	Halal          HalalSummary          `json:"halal"`
	Certifications CertificationSummary  `json:"certifications"`
	Alerts         AlertsSummary         `json:"alerts"`
	AIRisk         AIRiskSummary         `json:"ai_risk"`
	Operations     OperationsSummary     `json:"operations"`
	PostMortem     PostMortemSummary     `json:"post_mortem"`
	Carcasses      CarcassSummary        `json:"carcasses"`
	MeatProduction MeatProductionSummary `json:"meat_production"`
}

type SummaryMeta struct {
	Status string `json:"status"`
}
