import { Observable, from, concat } from 'rxjs'
import { HoverMerged } from '../../../shared/src/api/client/types/hover'
import { ExtensionsControllerProps } from '../../../shared/src/extensions/controller'
import { FileSpec, UIPositionSpec, RepoSpec, ResolvedRevisionSpec, toURIWithPath } from '../../../shared/src/util/url'
import { MaybeLoadingResult } from '@sourcegraph/codeintellify'
import { switchMap } from 'rxjs/operators'
import { wrapRemoteObservable } from '../../../shared/src/api/client/api/common'
import { DocumentHighlight, FileDecorationsByPath } from 'sourcegraph'
import { memoizeObservable } from '../../../shared/src/util/memoizeObservable'

/**
 * Fetches hover information for the given location.
 *
 * @param context the location
 * @returns hover for the location
 */
export function getHover(
    context: RepoSpec & ResolvedRevisionSpec & FileSpec & UIPositionSpec,
    { extensionsController }: ExtensionsControllerProps
): Observable<MaybeLoadingResult<HoverMerged | null>> {
    return concat(
        [{ isLoading: true, result: null }],
        from(extensionsController.extHostAPI).pipe(
            switchMap(extensionHost =>
                wrapRemoteObservable(
                    extensionHost.getHover({
                        textDocument: {
                            uri: toURIWithPath(context),
                        },
                        position: {
                            character: context.position.character - 1,
                            line: context.position.line - 1,
                        },
                    })
                )
            )
        )
    )
}

/**
 * Fetches document highlight information for the given location.
 *
 * @param context the location
 * @returns document highlights for the location
 */
export function getDocumentHighlights(
    context: RepoSpec & ResolvedRevisionSpec & FileSpec & UIPositionSpec,
    { extensionsController }: ExtensionsControllerProps
): Observable<DocumentHighlight[]> {
    return concat(
        [[]],
        from(extensionsController.extHostAPI).pipe(
            switchMap(extensionHost =>
                wrapRemoteObservable(
                    extensionHost.getDocumentHighlights({
                        textDocument: {
                            uri: toURIWithPath(context),
                        },
                        position: {
                            character: context.position.character - 1,
                            line: context.position.line - 1,
                        },
                    })
                )
            )
        )
    )
}

/**
 * Fetches file decorations
 *
 * Will sometimes ask for decorations for the same files, but is that an important enough problem
 * to solve (single child, then user clicks on its child)?
 */
export const getFileDecorations = memoizeObservable(
    ({
        files,
        extensionsController,
        commitID,
        repoName,
    }: {
        files: { url: string; isDirectory: boolean; name: string; path: string }[]
        nodeUrl: string
    } & ExtensionsControllerProps &
        RepoSpec &
        ResolvedRevisionSpec): Observable<FileDecorationsByPath> =>
        from(extensionsController.extHostAPI).pipe(
            switchMap(extensionHost =>
                wrapRemoteObservable(
                    extensionHost.getFileDecorations(
                        files.map(file => ({
                            ...file,
                            uri: toURIWithPath({ repoName, filePath: file.path, commitID }),
                        }))
                    )
                )
            )
        ),

    ({ nodeUrl, files }) => `nodeUrl:${nodeUrl} files:${files.length}`
)
