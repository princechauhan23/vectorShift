// submit.js

const SubmitButton = ({ onClick, disabled = false }) => {

    const handleSubmit = () => {
        if (!disabled) {
            onClick();
        }
    }
    return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px'}}>
            <button 
                type="button" 
                onClick={handleSubmit}
                disabled={disabled}
                style={{
                    padding: '12px 32px',
                    fontSize: '16px',
                    fontWeight: '600',
                    backgroundColor: disabled ? '#9ca3af' : '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease'
                }}
            >
                {disabled ? 'Processing...' : 'Submit Pipeline'}
            </button>
        </div>
    );
}

export default SubmitButton;