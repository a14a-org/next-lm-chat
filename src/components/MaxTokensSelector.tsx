import type React from "react";
import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

interface MaxTokensSelectorProps {
	maxTokens: number;
	onChangeMaxTokens: (value: number) => void;
}

const tokenOptions = [
	{ value: 2048, label: "2K tokens" },
	{ value: 4096, label: "4K tokens" },
	{ value: 8192, label: "8K tokens" },
	{ value: 16384, label: "16K tokens" },
	{ value: 32768, label: "32K tokens" },
];

const MaxTokensSelector: React.FC<MaxTokensSelectorProps> = ({
	maxTokens,
	onChangeMaxTokens,
}) => {
	const { theme } = useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleToggleDropdown = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		setIsOpen(!isOpen);
	};

	const handleSelectOption = (value: number) => {
		onChangeMaxTokens(value);
		setIsOpen(false);
	};

	// Get current selected option label
	const currentOptionLabel =
		tokenOptions.find((option) => option.value === maxTokens)?.label ||
		"8K tokens";

	return (
		<div className="max-tokens-selector">
			<label
				className="block text-base font-medium mb-3"
				style={{ color: theme === "light" ? "#111827" : "#d1d5db" }}
			>
				Maximum Output Tokens
			</label>

			<div className="relative" ref={dropdownRef}>
				<button
					type="button"
					className="flex items-center justify-between w-full p-4 text-base font-medium border rounded-xl border-[#F39880] hover:border-[#E87559]"
					style={{
						backgroundColor: theme === "light" ? "white" : "#1e1e29",
						color: theme === "light" ? "#111827" : "#d1d5db",
						borderColor: "#F39880",
						borderWidth: "2px",
					}}
					onClick={handleToggleDropdown}
					aria-haspopup="listbox"
					aria-expanded={isOpen}
				>
					<span
						className="truncate max-w-[90%] text-left"
						style={{ color: theme === "light" ? "#111827" : "#e5e7eb" }}
					>
						{currentOptionLabel}
					</span>
					<FiChevronDown
						className="ml-2 h-5 w-5 flex-shrink-0"
						style={{ color: theme === "light" ? "#4b5563" : "#9ca3af" }}
					/>
				</button>

				{isOpen && (
					<div
						className="absolute z-30 mt-2 w-full rounded-xl py-2 shadow-lg border"
						style={{
							backgroundColor: theme === "light" ? "white" : "#1e1e29",
							borderColor: theme === "light" ? "#e5e7eb" : "#374151",
							maxHeight: "300px",
							overflowY: "auto",
							position: "relative",
						}}
						role="listbox"
					>
						{tokenOptions.map((option) => (
							<button
								key={option.value}
								type="button"
								className={`w-full px-4 py-3 text-left focus:outline-none ${
									option.value === maxTokens
										? theme === "light"
											? "bg-gray-50"
											: "bg-gray-800"
										: ""
								}`}
								style={{
									backgroundColor:
										option.value === maxTokens
											? theme === "light"
												? "#f9fafb"
												: "#1f2937"
											: "transparent",
								}}
								onClick={() => handleSelectOption(option.value)}
								role="option"
								aria-selected={option.value === maxTokens}
							>
								<span
									className="text-lg font-medium"
									style={{ color: theme === "light" ? "#111827" : "#e5e7eb" }}
								>
									{option.label}
								</span>
							</button>
						))}
					</div>
				)}
			</div>

			<p
				className="mt-2 text-sm"
				style={{ color: theme === "light" ? "#6b7280" : "#9ca3af" }}
			>
				Higher values allow for longer responses
			</p>
		</div>
	);
};

export default MaxTokensSelector;
