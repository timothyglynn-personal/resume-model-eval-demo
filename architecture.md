flowchart TD

User --> WebApp

WebApp --> UploadResume
WebApp --> JobURL

UploadResume --> ResumeParser
JobURL --> JobScraper

ResumeParser --> ResumeText
JobScraper --> JobDescription

ResumeText --> EvaluationEngine
JobDescription --> EvaluationEngine

EvaluationEngine --> ModelSelector

ModelSelector --> OpenAI
ModelSelector --> Claude

OpenAI --> ScoringOutput
Claude --> ScoringOutput

ScoringOutput --> FitScore
ScoringOutput --> MissingKeywords
ScoringOutput --> Explanation

FitScore --> UI
MissingKeywords --> UI
Explanation --> UI

UI --> ResumeRewrite
UI --> CoverLetter

ResumeRewrite --> LLM
CoverLetter --> LLM

LLM --> DownloadableDoc

EvaluationEngine --> EvaluationLogger

EvaluationLogger --> MetricsDashboard
