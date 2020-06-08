import HelpCircleOutlineIcon from 'mdi-react/HelpCircleOutlineIcon'
import React from 'react'
import { renderMarkdown } from '../../../../shared/src/util/markdown'
import { QueryFieldExamples } from '../queryBuilder/QueryBuilderInputRow'
import { Menu, MenuButton, MenuPopover } from '@reach/menu-button'
import classNames from 'classnames'
import { pluralize } from '../../../../shared/src/util/strings'

interface Props {
    title: string
    markdown: string
    examples?: QueryFieldExamples[]
    alwaysShow?: boolean
}

export const InfoDropdown: React.FunctionComponent<Props> = props => (
    <Menu>
        {({ isExpanded }) => (
            <>
                <MenuButton className="pl-2 pr-0 btn btn-link d-flex align-items-center">
                    <HelpCircleOutlineIcon className="icon-inline small" />
                </MenuButton>
                <MenuPopover
                    className={classNames('info-dropdown', 'dropdown', {
                        'd-flex': isExpanded || props.alwaysShow,
                        show: isExpanded || props.alwaysShow,
                    })}
                    portal={false}
                >
                    <div
                        className={classNames('info-dropdown__item dropdown-menu dropdown-menu-right', {
                            show: isExpanded || props.alwaysShow,
                        })}
                    >
                        <div className="dropdown-header">
                            <strong>{props.title}</strong>
                        </div>
                        <div className="dropdown-divider" />
                        <div className="info-dropdown__content">
                            <small dangerouslySetInnerHTML={{ __html: renderMarkdown(props.markdown) }} />
                        </div>
                        {props.examples && (
                            <>
                                <div className="dropdown-divider" />
                                <div className="dropdown-header">
                                    <strong>{pluralize('Example', props.examples.length)}</strong>
                                </div>
                                <ul className="list-unstyled mb-2">
                                    {props.examples.map((ex: QueryFieldExamples) => (
                                        <div key={ex.value}>
                                            <div className="p-2">
                                                <span className="text-muted small">{ex.description}: </span>
                                                <code>{ex.value}</code>
                                            </div>
                                        </div>
                                    ))}
                                </ul>
                            </>
                        )}
                        <ul className="list-unstyled mb-2">
                            {props.examples?.map((ex: QueryFieldExamples) => (
                                <div key={ex.value}>
                                    <div className="p-2">
                                        <span className="text-muted small">{ex.description}: </span>
                                        <code>{ex.value}</code>
                                    </div>
                                </div>
                            ))}
                        </ul>
                    </div>
                </MenuPopover>
            </>
        )}
    </Menu>
)
