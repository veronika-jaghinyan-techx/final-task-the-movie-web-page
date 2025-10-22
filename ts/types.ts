// Common interfaces for Movie Data and API responses
export interface Genre {
	id: number;
	name: string;
}

export interface GenreResponse {
	genres: Genre[];
}

export interface Movie {
	adult: boolean;
	backdrop_path: string | null;
	genre_ids: number[];
	id: number;
	original_language: string;
	original_title: string;
	overview: string;
	popularity: number;
	poster_path: string | null;
	release_date: string;
	title: string;
	video: boolean;
	vote_average: number;
	vote_count: number;
}

export interface MovieResponse {
	total_pages: number;
	results: Movie[];
}

export interface MovieLanguage {
	code: string;
	label: string;
}

export interface Country {
	label: string;
	code: string;
	flag: string;
}

export interface Range {
	gte: number | string;
	lte?: number | string;
}

// Interface for the internal state of slider values
export interface SliderValues {
	vote_count: Range;
	vote_average: Range;
	with_runtime: Range;
}

// Interfaces for keyword search functionality
export interface Keyword {
	id: number;
	name: string;
}

export interface KeywordApiResponse {
	page: number;
	results: Keyword[];
	total_pages: number;
	total_results: number;
}
