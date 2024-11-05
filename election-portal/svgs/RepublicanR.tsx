/**
 *
 * @returns {JSX.Element} The RepublicanR component.
 */
export default function RepublicanR(): JSX.Element {
    return (
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="50"
          cy="50"
          r="43.5"
          stroke="#b83c2b"
          strokeWidth="13"
          fill="#FFFFFF"
        />
        <text
          x="50%"
          y="54.5%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="3.5rem"
          fontFamily="gelica"
          fontWeight="700"
          fill="#b83c2b"
          pointerEvents="none"
          style={{ userSelect: "none" }}
        >
          R
        </text>
      </svg>
    );
  }