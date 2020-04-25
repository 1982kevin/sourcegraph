import * as React from 'react'
import * as H from 'history'
import * as GQL from '../../../../../shared/src/graphql/schema'
import { ThemeProps } from '../../../../../shared/src/theme'
import { Collapsible } from '../../../components/Collapsible'
import CheckboxBlankCircleIcon from 'mdi-react/CheckboxBlankCircleIcon'
import SyncIcon from 'mdi-react/SyncIcon'
import { parseISO, formatDistance } from 'date-fns'
import { DiffStat } from '../../../components/diff/DiffStat'
import AlertCircleIcon from 'mdi-react/AlertCircleIcon'
import CollapseAllIcon from 'mdi-react/CollapseAllIcon'
import { FileDiffNode } from '../../../components/diff/FileDiffNode'
import { retryActionJob, updateActionJob } from './backend'
import { asError } from '../../../../../shared/src/util/errors'
import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'

interface Props extends ThemeProps {
    actionJob: GQL.IActionJob
    location: H.Location
    history: H.History
    onRetry: () => void
}

export const ActionJob: React.FunctionComponent<Props> = ({ isLightTheme, actionJob, location, history, onRetry }) => {
    const [isRetrying, setIsRetrying] = React.useState<boolean>(false)
    const [retryError, setRetryError] = React.useState<Error | undefined>()
    const retry = React.useCallback(async () => {
        setIsRetrying(true)
        setRetryError(undefined)
        try {
            await retryActionJob(actionJob.id)
            onRetry()
        } catch (error) {
            setRetryError(asError(error))
        } finally {
            setIsRetrying(false)
        }
    }, [actionJob.id, onRetry])
    const [isCanceling, setIsCanceling] = React.useState<boolean>(false)
    const [cancelError, setCancelError] = React.useState<Error | undefined>()
    const cancel = React.useCallback(async () => {
        setIsCanceling(true)
        setCancelError(undefined)
        try {
            await updateActionJob(actionJob.id, { state: GQL.ActionJobState.CANCELED })
            onRetry()
        } catch (error) {
            setCancelError(asError(error))
        } finally {
            setIsCanceling(false)
        }
    }, [actionJob.id, onRetry])
    return (
        <>
            <li className="list-group-item">
                <Collapsible
                    title={
                        <div className="ml-2 d-flex justify-content-between align-content-center">
                            <div className="flex-grow-1">
                                <h3 className="mb-1">Run on {actionJob.repository.name}</h3>
                                <p className="mb-0">
                                    {actionJob.agent ? (
                                        <small className="text-monospace">Agent {actionJob.agent.name}</small>
                                    ) : (
                                        <i>Awaiting agent assignment</i>
                                    )}
                                </p>
                            </div>
                            {actionJob.executionStartAt && !actionJob.executionEndAt && (
                                <div className="flex-grow-0">
                                    <p className="m-0 text-right mr-2">
                                        Started {formatDistance(parseISO(actionJob.executionStartAt), new Date())} ago
                                    </p>
                                </div>
                            )}
                            {actionJob.executionEndAt && (
                                <div className="flex-grow-0">
                                    <p className="m-0 text-right mr-2">
                                        {actionJob.state === GQL.ActionJobState.ERRORED
                                            ? 'Failed'
                                            : actionJob.state === GQL.ActionJobState.CANCELED
                                            ? 'Canceled'
                                            : 'Finished'}{' '}
                                        {formatDistance(parseISO(actionJob.executionEndAt), new Date())} ago
                                    </p>
                                </div>
                            )}
                            <div className="flex-grow-0">
                                {actionJob.state === GQL.ActionJobState.COMPLETED && (
                                    <div className="d-flex justify-content-end">
                                        <CheckboxBlankCircleIcon
                                            data-tooltip="Task is running"
                                            className="text-success"
                                        />
                                    </div>
                                )}
                                {actionJob.state === GQL.ActionJobState.PENDING && (
                                    <div className="d-flex justify-content-end">
                                        <CheckboxBlankCircleIcon
                                            data-tooltip="Task is pending"
                                            className="text-warning"
                                        />
                                    </div>
                                )}
                                {actionJob.state === GQL.ActionJobState.RUNNING && (
                                    <>
                                        {' '}
                                        <div className="d-flex justify-content-end">
                                            <SyncIcon
                                                data-tooltip="Task is running"
                                                className="text-info icon-spinning"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-secondary"
                                            disabled={isCanceling}
                                            onClick={cancel}
                                        >
                                            {isCanceling && <LoadingSpinner className="icon-inline" />} Cancel
                                            {cancelError && (
                                                <AlertCircleIcon
                                                    className="ml-2 icon-inline text-danger"
                                                    data-tooltip={cancelError}
                                                />
                                            )}
                                        </button>
                                    </>
                                )}
                                {actionJob.state === GQL.ActionJobState.CANCELED && (
                                    <div className="d-flex justify-content-end">
                                        <CollapseAllIcon data-tooltip="Task was canceled" className="text-warning" />
                                    </div>
                                )}
                                {actionJob.state === GQL.ActionJobState.ERRORED && (
                                    <>
                                        <div className="d-flex justify-content-end">
                                            <AlertCircleIcon data-tooltip="Task has failed" className="text-danger" />
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-secondary"
                                            disabled={isRetrying}
                                            onClick={retry}
                                        >
                                            {isRetrying && <LoadingSpinner className="icon-inline" />} Retry
                                            {retryError && (
                                                <AlertCircleIcon
                                                    className="ml-2 icon-inline text-danger"
                                                    data-tooltip={retryError}
                                                />
                                            )}
                                        </button>
                                    </>
                                )}
                                {actionJob.diff?.fileDiffs.diffStat && (
                                    <DiffStat {...actionJob.diff.fileDiffs.diffStat} />
                                )}
                            </div>
                        </div>
                    }
                    titleClassName="flex-grow-1"
                    wholeTitleClickable={false}
                >
                    {actionJob.log && (
                        <>
                            {' '}
                            <h5 className="mb-1">Log output</h5>
                            <div
                                className="p-1 mb-3"
                                // eslint-disable-next-line react/forbid-dom-props
                                style={{
                                    border: '1px solid grey',
                                    background: 'black',
                                    color: '#fff',
                                    overflowX: 'auto',
                                    maxHeight: '200px',
                                }}
                            >
                                <code dangerouslySetInnerHTML={{ __html: actionJob.log }} />
                                {actionJob.state === GQL.ActionJobState.RUNNING && (
                                    <div>
                                        <SyncIcon className="icon-inline icon-spinning" />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    <h5 className="mb-1">Generated diff</h5>
                    {/* eslint-disable-next-line react/forbid-dom-props */}
                    <div className="p-1" style={{ border: '1px solid grey' }}>
                        {actionJob.diff ? (
                            actionJob.diff.fileDiffs.nodes.map(fileDiffNode => (
                                <FileDiffNode
                                    isLightTheme={isLightTheme}
                                    node={fileDiffNode}
                                    lineNumbers={true}
                                    location={location}
                                    history={history}
                                    persistLines={false}
                                    // todo: is this a good key?
                                    key={fileDiffNode.internalID}
                                />
                            ))
                        ) : (
                            <p className="text-muted">
                                No diff has been generated{' '}
                                {[GQL.ActionJobState.PENDING, GQL.ActionJobState.RUNNING].includes(actionJob.state) &&
                                    ' yet'}
                            </p>
                        )}
                    </div>
                </Collapsible>
            </li>
        </>
    )
}
