package resolvers

import (
	"encoding/json"
	"strings"

	"github.com/pkg/errors"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/graphqlbackend"
)

type actionDefinitionResolver struct {
	steps  string
	envStr string
}

func (r *actionDefinitionResolver) Steps() graphqlbackend.JSONCString {
	return graphqlbackend.JSONCString(r.steps)
}

func (r *actionDefinitionResolver) Env() ([]graphqlbackend.ActionEnvVarResolver, error) {
	if strings.TrimSpace(r.envStr) == "" {
		return []graphqlbackend.ActionEnvVarResolver{}, nil
	}
	var parsed []struct {
		Key   string `json:"key"`
		Value string `json:"value"`
	}
	if err := json.Unmarshal([]byte(r.envStr), &parsed); err != nil {
		return nil, errors.Wrap(err, "invalid env stored")
	}
	envs := make([]graphqlbackend.ActionEnvVarResolver, len(parsed))
	for i, env := range parsed {
		envs[i] = &actionEnvVarResolver{
			key:   env.Key,
			value: env.Value,
		}
	}
	return envs, nil
}

type actionEnvVarResolver struct {
	key   string
	value string
}

func (r actionEnvVarResolver) Key() string {
	return r.key
}

func (r actionEnvVarResolver) Value() string {
	return r.value
}
