const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorthmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

async function robot(content) {
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    dividirConteudoEmFrases(content)

    async function fetchContentFromWikipedia(content) {
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaResponse.get()

        content.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizeContent(content) {
        const textoSemLinhasEmBrancoEMarkdown = removeLinhasEmBrancoEMarkdown(content.sourceContentOriginal)
        const textoSemDatasEntreParenteses = removeDatasEntreParenteses(textoSemLinhasEmBrancoEMarkdown)

        content.sourceContentSanitized = textoSemDatasEntreParenteses
        function removeLinhasEmBrancoEMarkdown(texto) {
            const todasAsLinhas = texto.split('\n')
            
            const textoSemLinhasEmBrancoEMarkdown2 = todasAsLinhas.filter((linha) => {
                if (linha.trim().length === 0 || linha.trim().startsWith('=')) {
                    return false
                }

                return true
            })

            return textoSemLinhasEmBrancoEMarkdown2.join(' ')
        }
    }

    function removeDatasEntreParenteses(texto) {
        return texto.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }

    function dividirConteudoEmFrases(content) {
        content.frases = []

        const frases = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        frases.forEach((frase) => {
            content.frases.push({
                text: frase,
                keywords: [],
                images: []
            })
        })
    }
}

module.exports = robot