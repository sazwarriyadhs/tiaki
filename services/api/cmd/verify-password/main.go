package main

import (
	"fmt"
	"os"

	"github.com/tiaki-platform/tiaki-api/internal/auth/password"
)

func main() {
	if len(os.Args) != 3 {
		os.Exit(1)
	}

	if err := password.Compare(os.Args[1], os.Args[2]); err != nil {
		fmt.Println("PASSWORD_MISMATCH")
		os.Exit(2)
	}

	fmt.Println("PASSWORD_MATCH")
}
