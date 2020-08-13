import Shepherd from 'shepherd.js'
import { isEqual } from 'lodash'

export const searchOnboardingTour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
        arrow: true,
        classes: 'web-content tour-card card p-2',
        popperOptions: {
            // Removes autofocus
            modifiers: [
                {
                    name: 'focusAfterRender',
                    enabled: false,
                },
            ],
        },
        attachTo: { on: 'bottom' },
        scrollTo: false,
    },
})

/**
 * generateStep creates a generic tooltip for the search tour. All steps that just contain
 * simple text should use this function to populate the step's `text` field.
 */
export function generateStep(stepNumber: number, text: string, closeButtonHandler: () => void): HTMLElement {
    const element = document.createElement('div')
    const textContainer = document.createElement('div')
    textContainer.innerHTML = text
    element.append(textContainer)
    const bottomRow = generateBottomRow(stepNumber, closeButtonHandler)
    element.append(bottomRow)
    return element
}

export function generateBottomRow(stepNumber: number, closeTourHandler: () => void): HTMLElement {
    const stepNumberLabel = document.createElement('span')
    stepNumberLabel.textContent = `Step ${stepNumber} of 5`

    const closeTourButton = document.createElement('button')
    closeTourButton.className = 'btn btn-link p-0'
    closeTourButton.textContent = 'Close tour'
    closeTourButton.addEventListener('click', () => {
        searchOnboardingTour.cancel()
        closeTourHandler()
    })

    const bottomRow = document.createElement('div')
    bottomRow.className = 'd-flex justify-content-between pt-2'
    bottomRow.append(stepNumberLabel)
    bottomRow.append(closeTourButton)
    return bottomRow
}

/** Onboarding tour */
export function generateStep1(languageButtonHandler: () => void, repositoryButtonHandler: () => void): HTMLElement {
    const element = document.createElement('div')
    element.className = 'd-flex flex-column'
    const title = document.createElement('h4')
    title.textContent = 'Code search tour'
    const description = document.createElement('div')
    description.textContent = 'How would you like to begin?'
    const languageListItem = document.createElement('li')
    languageListItem.className = 'list-group-item p-0 border-0'
    languageListItem.textContent = '-'
    const languageButton = document.createElement('button')
    languageButton.className = 'btn btn-link p-0 pl-1'
    languageButton.textContent = 'Search a language'
    languageListItem.append(languageButton)
    // TODO farhan: Need to tell our tour that we're on the lang path
    languageButton.addEventListener('click', () => {
        languageButtonHandler()
        searchOnboardingTour.show('step-2-lang')
    })
    const repositoryListItem = document.createElement('li')
    repositoryListItem.className = 'list-group-item p-0 border-0'
    repositoryListItem.textContent = '-'
    const repositoryButton = document.createElement('button')
    repositoryButton.className = 'btn btn-link p-0 pl-1'
    repositoryButton.textContent = 'Search a repository'
    // TODO farhan: Need to tell our tour that we're on the repo path
    repositoryButton.addEventListener('click', () => {
        repositoryButtonHandler()
        searchOnboardingTour.show('step-2-repo')
    })
    repositoryListItem.append(repositoryButton)
    element.append(title)
    element.append(description)
    element.append(languageListItem)
    element.append(repositoryListItem)
    const bottomRow = generateBottomRow(1, () => true)
    element.append(bottomRow)
    return element
}

export function generateAddCodeStep(): HTMLElement {
    const element = document.createElement('div')
    const title = document.createElement('h4')
    title.textContent = 'Add code to your search'
    const description = document.createElement('div')
    element.append(title)

    description.textContent = 'Type the name of a function, variable or other code.'
    element.append(description)
    // TODO farhan -- handler
    generateBottomRow(3, () => {})
    return element
}

/**
 * A list of
 */
export const languageFilterToSearchExamples: { [key: string]: string } = {
    'lang:c': 'try {:[my_match]}',
    'lang:cpp': 'try {:[my_match]}',
    'lang:csharp': 'try {:[my_match]}',
    'lang:css': 'body {:[my_match]}',
    'lang:go': 'for {:[my_match]}',
    'lang:graphql': 'Query {:[my_match]}',
    'lang:haskell': 'if :[my_match] else',
    'lang:html': '<div class="panel">:[my_match]</div>',
    'lang:java': 'try {:[my_match]}',
    'lang:javascript': 'try {:[my_match]}',
    'lang:json': '"object":{:[my_match]}',
    'lang:lua': 'function update() :[my_match] end',
    'lang:markdown': '',
    'lang:php': 'try {:[my_match]}',
    'lang:powershell': 'try {:[my_match]}',
    'lang:python': 'try:[my_match] except',
    'lang:r': 'tryCatch( :[my_match )',
    'lang:ruby': 'while :[my_match] end',
    'lang:sass': 'transition( :[my_match] )',
    'lang:swift': 'switch :[a]{:[b]}',
    'lang:typescript': 'try{:[my_match]}',
}

/**
 * Generates the content for step 3 in the tour, in the language path, which asks users to input their own query
 *
 * @param languageQuery the current query including a `lang:` filter. Used for language queries so we know what examples to suggest.
 */
export function generateLangInputStep(languageQuery: string, exampleCallback: (query: string) => void): HTMLElement {
    const element = document.createElement('div')
    const title = document.createElement('h4')
    title.textContent = 'Add code to your search'
    const description = document.createElement('div')

    element.append(title)
    description.textContent = 'Type the name of a function, variable or other code. Or try an example:'
    element.append(description)
    const listItem = document.createElement('li')
    listItem.className = 'list-group-item p-0 border-0'
    listItem.textContent = '>'

    const exampleButton = document.createElement('button')
    exampleButton.className = 'btn btn-link'

    const langsList = languageFilterToSearchExamples
    let example = ''
    if (languageQuery && Object.keys(langsList).includes(languageQuery)) {
        example = langsList[languageQuery]
    }

    exampleButton.textContent = example
    exampleButton.addEventListener('click', () => {
        const fullQuery = [languageQuery, example].join(' ')
        exampleCallback(fullQuery)
        searchOnboardingTour.show('step-4')
    })
    listItem.append(exampleButton)
    element.append(listItem)
    const bottomRow = generateBottomRow(3, () => {})
    element.append(bottomRow)
    // TODO farhan -- handler
    generateBottomRow(3, () => {})
    return element
}

export const isValidLangQuery = (query: string): boolean => Object.keys(languageFilterToSearchExamples).includes(query)

export function endAddCodeToYourQuery(): void {
    if (
        isEqual(searchOnboardingTour.getCurrentStep(), searchOnboardingTour.getById('step-3')) &&
        searchOnboardingTour.getCurrentStep()?.isOpen()
    ) {
        searchOnboardingTour.show('step-4')
    }
}

export function endRepoInputStep(): void {
    if (
        isEqual(searchOnboardingTour.getCurrentStep(), searchOnboardingTour.getById('step-2-repo')) &&
        searchOnboardingTour.getCurrentStep()?.isOpen()
    ) {
        searchOnboardingTour.show('step-3')
        searchOnboardingTour.getById('step-3').updateStepOptions({ text: generateAddCodeStep() })
    }
}

export function endLangInputStep(query: string, setQueryHandler: (query: string) => void): void {
    if (
        isEqual(searchOnboardingTour.getCurrentStep(), searchOnboardingTour.getById('step-2-lang')) &&
        searchOnboardingTour.getCurrentStep()?.isOpen()
    ) {
        searchOnboardingTour.show('step-3')
        searchOnboardingTour.getById('step-3').updateStepOptions({
            text: generateLangInputStep(query ?? '', (newQuery: string) => setQueryHandler(newQuery)),
        })
    }
}

/** *
 * The types below allow us to end steps in the tour from components outside of the SearchPageInput component
 * where the tour is located. In particular, we want to advance tour steps when a user types or updates the query input
 * after a debounce period, on certain conditions such as the contents of the query.
 */

/**
 *
 */
export interface advanceStepCallback {
    /**
     * The ID of the step to advance from.
     */
    stepToAdvance: string
    /**
     * Conditions that must be true before advancing to the next step.
     */
    queryConditions?: (query: string) => boolean
}

/**
 * Defines a callback for a normal step.
 */
type standardStepCallback = advanceStepCallback & { handler: () => void }

/**
 * A special case type to define a callback for a the "add code to your query" step on the language path.
 * The handler takes a query and setQueryHandler, which allows us to generate the appropriate tooltip
 * content for the next step.
 */
type endLanguageInputStep = advanceStepCallback & {
    handler: (query: string, setQueryHandler: (query: string) => void) => void
}

export type advanceStepCallbackType = standardStepCallback | endLanguageInputStep

/**
 * A list of callbacks that will advance certain steps when the query input's value is changed.
 */
export const stepCallbacks: advanceStepCallbackType[] = [
    {
        stepToAdvance: 'step-2-repo',
        handler: endRepoInputStep,
        queryConditions: (query: string): boolean => query !== 'repo:',
    },
    {
        stepToAdvance: 'step-2-lang',
        handler: endLangInputStep,
        queryConditions: (query: string): boolean => query !== 'lang:' && isValidLangQuery(query),
    },
    {
        stepToAdvance: 'step-3',
        handler: endAddCodeToYourQuery,
        queryConditions: (query: string): boolean => query !== 'repo:' && query !== 'lang:',
    },
]
