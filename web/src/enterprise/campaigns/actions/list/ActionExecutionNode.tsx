import React from 'react'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { Link } from '../../../../../../shared/src/components/Link'
import AlertCircleIcon from 'mdi-react/AlertCircleIcon'
import CheckboxBlankCircleIcon from 'mdi-react/CheckboxBlankCircleIcon'
import SyncIcon from 'mdi-react/SyncIcon'
import CollapseAllIcon from 'mdi-react/CollapseAllIcon'

export interface ActionNodeProps {
    node: Pick<GQL.IActionExecution, 'id' | 'invocationReason' | 'status' | 'patchSet'>
}

/**
 * An item in the list of action executions.
 */
export const ActionExecutionNode: React.FunctionComponent<ActionNodeProps> = ({ node }) => (
    <li className="list-group-item">
        <div className="ml-2 d-flex justify-content-between align-content-center">
            <div className="flex-grow-1">
                <h3 className="mb-1">
                    <Link to={`/campaigns/actions/executions/${node.id}`} className="d-block">
                        {node.id}
                    </Link>
                </h3>
                <p className="mb-0">{node.invocationReason}</p>
            </div>
            <div className="flex-grow-0">
                <div className="d-flex justify-content-end">
                    {node.status.state === GQL.BackgroundProcessState.COMPLETED && (
                        <CheckboxBlankCircleIcon
                            data-tooltip="Execution has finished successful"
                            className="text-success"
                        />
                    )}
                    {node.status.state === GQL.BackgroundProcessState.PROCESSING && (
                        <SyncIcon data-tooltip="Execution is running" className="text-info icon-spinning" />
                    )}
                    {node.status.state === GQL.BackgroundProcessState.CANCELED && (
                        <CollapseAllIcon data-tooltip="Execution has been canceled" className="text-warning" />
                    )}
                    {node.status.state === GQL.BackgroundProcessState.ERRORED && (
                        <>
                            <AlertCircleIcon data-tooltip="Execution has failed" className="text-danger" />
                            <button type="button" className="btn btn-sm btn-secondary">
                                Retry
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    </li>
)
